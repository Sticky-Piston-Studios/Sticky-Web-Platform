# Pull nginx:latest image
FROM nginx:latest

# Run command to start Nginx
# This will periodically reload the Nginx configuration to pick up changes in the /etc/nginx/conf.d directory
CMD ["/bin/sh", "-c", "while :; do sleep 12h & wait $${!}; nginx -s reload; done & nginx -g 'daemon off;'"]