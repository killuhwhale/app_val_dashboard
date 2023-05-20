
<img src="https://raw.githubusercontent.com/killuhwhale/app_val_dashboard/public/appvalDashboard.png?sanitize=true&raw=true" />
# Deployment to GCP

    gcloud auth application-default login

 Modify .env to prod URL
  - NEXTAUTH_URL="http://localhost:3000"

 Run:
    gcloud app deploy
    - runs off app.yaml


# GCP is setup to execute commands on Host Linux Machine
## Linux Machine
    - Edit .bashrc to allow non-interactive sessions, comment out lines at top of file.
    - Install openssh server: sudo apt-get install openssh-server
    - edit /etc/ssh/sshd_config
        - Turn off passwords: PasswordAuthentication, PasswordAuthentication, UsePAM
    - On Server run (if no ~/.ssh/id_rsa.pub)
        -  ssh-keygen -t rsa -b 4096
    - Copy GCP server's ~/.ssh/id_rsa.pub to ~/.ssh/authorized_keys on Linux machine
    - Restart SSH server
        - sudo service ssh restart

## Execute SSH Command From GCP
ssh samus@92.23.642.127 "source appium/bin/activate; python3 appium/src/main.py -i 192.168.0.133:1337;"


# Dev Env

"[typescriptreact]": {
    "editor.formatOnSave": true
}


# TODOs
- Add Label "to"  between Start and End Date

- Create a few graphs to show the data.
   - A set of graphs for the selected AppRun Result
        - Show Totals

   - A set of graphs for all the app runs selected
    - Show Totals compared in each run
