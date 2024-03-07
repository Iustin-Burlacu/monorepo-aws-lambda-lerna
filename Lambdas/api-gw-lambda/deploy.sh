RED='\033[0;31m'
NC='\033[0m' # No Color
GREEN='\033[0;32m'
LCYAN='\033[0;36m'

lambda_name=''
lambda_region='eu-west-1'

echo "${LCYAN}[*] Cleaning env${NC}"
rm -f dist.zip
echo "${GREEN}:) Cleaned${NC}"

echo " "
echo "${LCYAN}[*] Creating archive${NC}"
cp -r node_modules dist/
zip -r dist.zip dist >> /dev/null

echo "${GREEN}:) Archive Created${NC}"

echo " "
echo "${LCYAN}[*] Deploying zip archive to lambda $lambda_name${NC}"
output=$(aws lambda update-function-code --function-name $lambda_name --region $lambda_region --zip-file fileb://dist.zip 2>&1)
if [ $? -ne 0 ]; then
    # The command failed, print the output
    echo "Error: $output"
else
    echo "${GREEN}:) Deployed zip package${NC}"
fi
