# Specify colors utilized in the terminal
red=$(tput setaf 1)                        #  red
grn=$(tput setaf 2)                        #  green
ylw=$(tput setaf 3)                        #  yellow
blu=$(tput setaf 4)                        #  blue
cya=$(tput rev)$(tput bold)$(tput setaf 6) #  bold cyan reversed
ylr=$(tput rev)$(tput bold)$(tput setaf 3) #  bold yellow reversed
grr=$(tput rev)$(tput bold)$(tput setaf 2) #  bold green reversed
rer=$(tput rev)$(tput bold)$(tput setaf 1) #  bold red reversed
txtrst=$(tput sgr0)                        #  Reset

SSH="myHetzner"
PROJ_ROOT="~/backends/kredent-api"

echo ${ylr}"Yarn build"${txtrst}
yarn run build
if [ $? -ne 0 ]; then
    echo ${red}"🔥 error: Build is not successfull. Exiting..."${txtrst} && exit 1
fi

echo ${ylr}"Copy the build files to server using rsync"${txtrst}
rsync -avz --delete package.json yarn.lock build ${SSH}:${PROJ_ROOT}

# Check if files copied successfully
if [ $? -eq 0 ];
then
    echo ${ylr}"Update node_modules & restart pm2"${txtrst}
    ssh ${SSH} "cd ${PROJ_ROOT} && source ~/.nvm/nvm.sh && nvm use 16 && yarn install && pm2 restart kredent-api"
else
    echo ${red}"🔥 error: Failed to copy build files to server"${txtrst}
fi
