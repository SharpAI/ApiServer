pipeline {
  agent any
  stages {
    stage('BuildClient') {
      steps {
        dir(path: 'hotShareMobile') {
          sh './cleanbuild.sh'
          sh './build.sh'
        }
      }
    }
    stage('PackageSharpAIClient') {
      steps {
        dir(path: 'hotShareMobile') {
          sh './android_gen_apk.sh'
          sh './ios_auto_deploy.sh'
        }
      }
    }
    stage('PackageSharpAIServer') {
      steps {
        dir(path: 'hotShareWeb') {
          sh './server_package.sh'
        }
      }
    }
  }
}
