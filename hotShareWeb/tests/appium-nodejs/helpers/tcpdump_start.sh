adb shell << EOF
su
cd /data
rm -rf ./a.cap
./tcpdump.sh &
exit
exit
EOF
