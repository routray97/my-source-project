pipeline {
  agent any

  environment {
    SCANNER_HOME       = tool 'sonar-scanner'
    SONAR_TOKEN        = credentials('sonar-token')
    SONAR_ORGANIZATION = 'routray97'
    SONAR_PROJECT_KEY  = 'routray97_my-source-project'
  }

  stages {
    stage('Code-Analysis') {
      steps {
        withSonarQubeEnv('SonarCloud') {
          sh """
            $SCANNER_HOME/bin/sonar-scanner \
              -Dsonar.organization=${SONAR_ORGANIZATION} \
              -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
              -Dsonar.sources=. \
              -Dsonar.host.url=https://sonarcloud.io \
              -Dsonar.login=${SONAR_TOKEN}
          """
        }
      }
    }

    stage('Docker Build And Push') {
      steps {
        script {
          docker.withRegistry('', 'docker-cred') {
            def img = docker.build("routrayashish76/crud-123:${BUILD_NUMBER}")
            img.push()
            img.push('latest')
          }
        }
      }
    }

    stage('Deploy To EC2') {
      steps {
        script {
          sh 'docker rm -f $(docker ps -q) || true'
          sh 'docker run -d -p 3000:3000 routrayashish76/crud-123:latest'
        }
      }
    }
  }

  post {
    always { echo "🎯 Build finished: ${currentBuild.currentResult}" }
    failure { echo "🚨 Build failed — check logs!" }
    success { echo "✅ Build succeeded" }
  }
}
