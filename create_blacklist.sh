#! /bin/bash
>blacklist_temp.txt
machines=$(cat all_machines.txt)
for machine in $machines; do
    echo Trying "$machine" 
    timeout 5 ssh -o PasswordAuthentication=no "$machine" /bin/true
    if [ $? != 0 ];then
        echo "$machine" >> blacklist_temp.txt
    fi
done

cp blacklist_temp.txt blacklist.txt
rm blacklist_temp.txt