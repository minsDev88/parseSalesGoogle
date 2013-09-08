#NOW=$(date +"%Y%m")
NOW=$(date +%C%y%m -d -2days)
echo $NOW $(date)

rm /home/cdn/analytics/parseSalesGoogle/input/*.zip
rm /home/cdn/analytics/parseSalesGoogle/input/*.csv

/opt/ActivePython-2.7/bin/python /home/cdn/analytics/gsutil/gsutil cp -r gs://pubsite_prod_rev_14181528505147530469/sales/salesreport_$NOW.zip /home/cdn/analytics/parseSalesGoogle/input/

unzip -d /home/cdn/analytics/parseSalesGoogle/input/ /home/cdn/analytics/parseSalesGoogle/input/*.zip

/usr/local/bin/node /home/cdn/analytics/parseSalesGoogle/main.js
