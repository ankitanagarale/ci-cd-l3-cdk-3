#!/bin/bash
export TOMCAT_HOME="/opt/apache-tomcat-9.0.95"
echo $TOMCAT_HOME
sudo $TOMCAT_HOME/bin/shutdown.sh
sudo rm -rf $TOMCAT_HOME/webapps/*
sudo mv /tmp/cas-scheduler.war /tmp/ROOT.war
sudo cp -R /tmp/*.war $TOMCAT_HOME/webapps
sudo $TOMCAT_HOME/bin/startup.sh

# Wait for Tomcat to fully stop (adjust the sleep duration based on your application's shutdown time)
# sleep 10

# Start Tomcat
# sudo $TOMCAT_HOME/bin/startup.sh
# sleep 30
# tail -f $TOMCAT_HOME/logs/catalina.out