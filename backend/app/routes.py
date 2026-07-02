from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError

from app.extensions import db
from app.models import VALID_PRIORITIES, VALID_STATUSES, Task

tasks_bp = Blueprint("tasks", __name__, url_prefix="/api/tasks")


def _validate_payload(data, partial=False):
    """Returns an error message string, or None if the payload is valid."""
    if not partial:
        if not data.get("title") or not str(data.get("title")).strip():
            return "title is required"

    if "title" in data and not str(data["title"]).strip():
        return "title cannot be empty"

    if "status" in data and data["status"] not in VALID_STATUSES:
        return f"status must be one of {sorted(VALID_STATUSES)}"

    if "priority" in data and data["priority"] not in VALID_PRIORITIES:
        return f"priority must be one of {sorted(VALID_PRIORITIES)}"

    return None


@tasks_bp.route("", methods=["GET"])
def list_tasks():
    """List tasks, optionally filtered by ?status= and/or ?priority=."""
    query = Task.query

    status = request.args.get("status")
    if status:
        query = query.filter_by(status=status)

    priority = request.args.get("priority")
    if priority:
        query = query.filter_by(priority=priority)

    tasks = query.order_by(Task.created_at.desc()).all()
    return jsonify([t.to_dict() for t in tasks]), 200


@tasks_bp.route("/<int:task_id>", methods=["GET"])
def get_task(task_id):
    task = Task.query.get(task_id)
    if task is None:
        return jsonify({"error": "task not found"}), 404
    return jsonify(task.to_dict()), 200


@tasks_bp.route("", methods=["POST"])
def create_task():
    data = request.get_json(silent=True) or {}

    error = _validate_payload(data, partial=False)
    if error:
        return jsonify({"error": error}), 400

    task = Task(
        title=data["title"].strip(),
        description=data.get("description"),
        status=data.get("status", "pending"),
        priority=data.get("priority", "medium"),
    )

    try:
        db.session.add(task)
        db.session.commit()
    except SQLAlchemyError as exc:
        db.session.rollback()
        return jsonify({"error": "database error", "detail": str(exc)}), 500

    return jsonify(task.to_dict()), 201


@tasks_bp.route("/<int:task_id>", methods=["PUT", "PATCH"])
def update_task(task_id):
    task = Task.query.get(task_id)
    if task is None:
        return jsonify({"error": "task not found"}), 404

    data = request.get_json(silent=True) or {}
    error = _validate_payload(data, partial=True)
    if error:
        return jsonify({"error": error}), 400

    for field in ("title", "description", "status", "priority"):
        if field in data:
            setattr(task, field, data[field].strip() if field == "title" else data[field])

    try:
        db.session.commit()
    except SQLAlchemyError as exc:
        db.session.rollback()
        return jsonify({"error": "database error", "detail": str(exc)}), 500

    return jsonify(task.to_dict()), 200


@tasks_bp.route("/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    task = Task.query.get(task_id)
    if task is None:
        return jsonify({"error": "task not found"}), 404

    try:
        db.session.delete(task)
        db.session.commit()
    except SQLAlchemyError as exc:
        db.session.rollback()
        return jsonify({"error": "database error", "detail": str(exc)}), 500

    return jsonify({"message": "task deleted", "id": task_id}), 200
