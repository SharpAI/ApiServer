#!/bin/bash
while [ 1 ];
do
  echo "starting test";
  time (export i=0; while [ $i -lt 10 ]; \
                  do phantomjs get.js http://localhost:9000/posts/HeaGZBwWtMRDsfLqW > /dev/null & (( i ++ )); \
                  done; wait)
done;
