[1mdiff --git a/scripts/info_flow.py b/scripts/info_flow.py[m
[1mindex 9bf7c8d..45b878a 100644[m
[1m--- a/scripts/info_flow.py[m
[1m+++ b/scripts/info_flow.py[m
[36m@@ -1,6 +1,7 @@[m
 import os[m
 import re[m
 from collections import defaultdict[m
[32m+[m[32mimport json[m
 [m
 def get_js_and_ejs_files(directory):[m
     js_files = [][m
[36m@@ -73,4 +74,8 @@[m [mif __name__ == "__main__":[m
         for key, value in data.items():[m
             print(f"{key}: {value}")[m
     # files = get_js_and_ejs_files("../")[m
[31m-    # print(files)[m
\ No newline at end of file[m
[32m+[m[32m    # print(files)[m
[32m+[m[32m# import json[m
[32m+[m
[32m+[m[32m# with open("js_ifc_metrics.json", "w") as f:[m
[32m+[m[32m#     json.dump(results, f, indent=2)[m
\ No newline at end of file[m
