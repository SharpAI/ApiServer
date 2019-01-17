# coding:utf8

import sys
import os

from minio import Minio
from minio.error import ResponseError

minioClient = Minio('192.168.31.62:9000',
                    access_key='QUA2IU17RHOKE6NUZ7T2',
                    secret_key='MQniMc5K3lsRbv9OPaUbJN9ft2eTQJ1rh4Yx6C17',
                    secure=False)


if not minioClient.bucket_exists("sharpai"):
    print("sharpai bucket is not found!")
    sys.exit()

# for i in range(len(os.listdir("cut_vedio_images/images"))):
#     if i > 202:
#         break

#     file_name = "vedio_cut_%d.jpg" % (i + 1)
#     print(file_name)

#     try:
#         minioClient.fput_object("sharpai", file_name, os.path.join(
#             "cut_vedio_images/images", file_name))
#     except ResponseError as err:
#         print(err)

for file in os.listdir("cut_vedio_images/images/5"):
    if not file.endswith(".jpg"):
        continue

    try:
        minioClient.fput_object("sharpai", file, os.path.join(
            "cut_vedio_images/images/5", file))
        print(file)
    except ResponseError as err:
        print(err)
