adb shell << EOF
su
sync
sleep 1
cd /data
./tcpdump_kill.sh
exit
exit
EOF
