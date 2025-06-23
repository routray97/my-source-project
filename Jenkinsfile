pipeline {
  agent any

  environment {
    SCANNER_HOME       = tool 'sonar-scanner'            // ensure this tool is defined
    SONAR_TOKEN        = credentials('sonar-token')      // secret text credential
    SONAR_ORGANIZATION = 'jenkins-project-123'
    SONAR_PROJECT_KEY  = 'jenkins-project-123_ci-jenkins'
  }

  stages {
    stage('Code-Analysis') {
      steps {
        withSonarQubeEnv('SonarCloud') {
          sh """
            $SCANNER_HOME/bin/sonar-scanner \
              -Dsonar.organization=$SONAR_ORGANIZATION \
              -Dsonar.projectKey=$SONAR_PROJECT_KEY \
              -Dsonar.sources=. \
              -Dsonar.host.url=https://sonarcloud.io \
              -Dsonar.login=$SONAR_TOKEN
          """
        }
      }
    }

    stage('Docker Build And Push') {
      steps {
        script {
          docker.withRegistry('', 'docker-cred') {
            def image = docker.build("pekker123/crud-123:latest")
            image.push()
          }
        }
      }
    }

    stage('Deploy To EC2') {
      steps {
        script {
          sh 'docker rm -f $(docker ps -q) || true'
          sh 'docker run -d -p 3000:3000 pekker123/crud-123:latest'
        }
      }
    }
  }

  post {
    always {
      echo "🎯 Build finished with status: ${currentBuild.currentResult}"
    }
    failure {
      echo "🚨 Build failed – check logs"
    }
    success {
      echo "✅ Build succeeded"
    }
  }
}
