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


# TODO()
Add Sorting to AppResults
Add Label to Start and End Date
Enhance Label to AppRunResults next num results, also make overflow-x-auto
Create modal for History and Logs
    History should show a list of hist w/ imgs
    Logs should be printed with markup

Create a few graphs to show the data.
   - A set of graphs for the selected AppRun Result
        - Show Totals

   - A set of graphs for all the app runs selected
    - Show Totals compared in each run



# FireStore Structure

# Collection AppRuns
# Doc


Tradeoffs


GCP Bound

Feature wanted - Website based btn to trigger runs

WS or SSH to send cmd to remote linux machine would be some of the techniques

SSH -> setup IPs
WS -> LocalWebserver site open to establish to websocket on webserver
    -> requires local web site to be open to make the connection to the site
        -> at the time of the local site being opened a connection is made
            -> If we then open the prod site, how would we connect to same session?
                -> in nodejs ws, not sure how to do this
                -> in django channels, we create a channel to connect to like a chatroom
                    -> can connect to channel without website being opened...
                        - The channel is a ws server endpoint essentially.
                ->NodeJs must have the same thing w/ express
                    - Setup awebscoket server in nodejs with a channel
                        - Then the local host connects to the channel and when we conenct w/ prod, we also connect to channel.
