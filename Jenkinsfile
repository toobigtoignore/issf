pipeline {
    agent any 

    environment {
        DJANGO_SETTINGS_MODULE = 'issf_prod.settings'
    }

    stages { 
        stage('Build') {
            agent any
            steps {
                sh './first_run.sh'
            }
        }    
    }
}
