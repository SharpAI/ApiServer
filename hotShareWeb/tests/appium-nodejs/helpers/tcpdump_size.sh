adb shell << EOF
su
touch /data/a.cap
du /data/a.cap
exit
exit
EOF
