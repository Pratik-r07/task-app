pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKERHUB_USERNAME    = "pratik4106"
        GIT_REPO_URL          = "https://github.com/Pratik-r07/task-app.git"
        BACKEND_IMAGE         = "${DOCKERHUB_USERNAME}/task-app-backend"
        FRONTEND_IMAGE        = "${DOCKERHUB_USERNAME}/task-app-frontend"
        IMAGE_TAG             = "v${BUILD_NUMBER}"
        KUBECONFIG            = "/var/jenkins_home/kubeconfig"
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '5'))
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_MSG = sh(
                        script: 'git log -1 --pretty=%B',
                        returnStdout: true
                    ).trim()
                    echo "Building: ${env.GIT_COMMIT_MSG}"
                }
            }
        }

        stage('Build Images') {
            parallel {
                stage('Build Backend') {
                    steps {
                        sh """
                            docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} \
                                         -t ${BACKEND_IMAGE}:latest \
                                         ./backend
                        """
                    }
                }
                stage('Build Frontend') {
                    steps {
                        sh """
                            docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} \
                                         -t ${FRONTEND_IMAGE}:latest \
                                         ./frontend
                        """
                    }
                }
            }
        }

        stage('Push Images') {
            steps {
                sh """
                    echo ${DOCKERHUB_CREDENTIALS_PSW} | \
                    docker login -u ${DOCKERHUB_USERNAME} --password-stdin
                """
                sh """
                    docker push ${BACKEND_IMAGE}:${IMAGE_TAG}
                    docker push ${BACKEND_IMAGE}:latest
                    docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}
                    docker push ${FRONTEND_IMAGE}:latest
                """
            }
            post {
                always {
                    sh 'docker logout'
                }
            }
        }

        stage('Update K8s Manifests') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'github-credentials',
                    usernameVariable: 'GIT_USER',
                    passwordVariable: 'GIT_TOKEN'
                )]) {
                    sh """
                        git config user.email "jenkins@task-app.local"
                        git config user.name "Jenkins CI"

                        sed -i 's|image: ${BACKEND_IMAGE}:.*|image: ${BACKEND_IMAGE}:${IMAGE_TAG}|g' \
                            k8s/backend/deployment.yaml

                        sed -i 's|image: ${FRONTEND_IMAGE}:.*|image: ${FRONTEND_IMAGE}:${IMAGE_TAG}|g' \
                            k8s/frontend/deployment.yaml

                        git add k8s/backend/deployment.yaml k8s/frontend/deployment.yaml
                        git commit -m "ci: update images to ${IMAGE_TAG} [skip ci]"
                        git push https://${GIT_USER}:${GIT_TOKEN}@github.com/Pratik-r07/task-app.git HEAD:main
                    """
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                sh """
                    kubectl --kubeconfig=${KUBECONFIG} rollout status \
                        deployment/backend -n task-app --timeout=120s

                    kubectl --kubeconfig=${KUBECONFIG} rollout status \
                        deployment/frontend -n task-app --timeout=120s

                    kubectl --kubeconfig=${KUBECONFIG} get pods -n task-app
                """
            }
        }
    }

    post {
        success {
            echo """
            ✅ Pipeline SUCCESS!
            Backend:  ${BACKEND_IMAGE}:${IMAGE_TAG}
            Frontend: ${FRONTEND_IMAGE}:${IMAGE_TAG}
            """
        }
        failure {
            echo "❌ Pipeline FAILED — check logs above"
        }
        always {
            sh """
                docker rmi ${BACKEND_IMAGE}:${IMAGE_TAG} || true
                docker rmi ${FRONTEND_IMAGE}:${IMAGE_TAG} || true
            """
            cleanWs()
        }
    }
}
