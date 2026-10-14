set -a
. ./.env
set +a
java -jar target/payara-micro.jar --deploy target/dormitory.war --contextroot ROOT --port 8080
