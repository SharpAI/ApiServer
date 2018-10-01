pipeline {
  agent any
  stages {
    stage('BuildClient') {
      steps {
        dir(path: 'hotShareMobile') {
          sh './cleanbuild.sh'
          timeout(time: 60, unit: 'MINUTES') {
            sh './build.sh'
          }
        }
      }
    }
    stage('PackageSharpAIClient') {
      steps {
        dir(path: 'hotShareMobile') {
          sh './android_gen_apk.sh'
          timeout(time: 60, unit: 'MINUTES') {
            sh './ios_auto_deploy.sh'
          }
        }
      }
    }
    stage('PackageSharpAIServer') {
      steps {
        dir(path: 'hotShareWeb') {
          timeout(time: 60, unit: 'MINUTES') {
            sh './server_package.sh'
          }
        }
      }
    }
  }
}
