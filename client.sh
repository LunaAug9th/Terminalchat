#!/bin/bash

last_sent_message=""
last_received_message=""
server_address=""
base16_key=""

# Function to send a message
send_message() {
    local message="$1"
    if [[ "$message" == "$last_sent_message" ]]; then
        echo "The message is identical to the last sent message. Ignoring."
        return
    fi

    last_sent_message="$message"
    local encoded_message
    encoded_message=$(echo -n "$message" | xxd -p | tr -d '\n')
    local url="${server_address}/send.${encoded_message}?key=${base16_key}"

    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    if [[ "$response" == "200" ]]; then
        echo "Message sent!"
    else
        echo "Failed to send message. Status code: $response"
    fi
}

# Function to read messages
read_messages() {
    local url="${server_address}/read?key=${base16_key}"

    while :; do
        data=$(curl -s "$url")
        if [[ "$data" != "$last_received_message" && "$data" != $(echo -n "$last_sent_message" | xxd -p | tr -d '\n') ]]; then
            last_received_message="$data"
            decoded_message=$(echo -n "$data" | xxd -r -p 2>/dev/null)
            if [[ $? -eq 0 ]]; then
                echo "RECEIVE: $decoded_message"
            else
                echo "RECEIVE: (invalid hex message)"
            fi
        fi
        sleep 0.25
    done
}

# Main script
read -p "Enter server address: " server_address
if [[ ! "$server_address" =~ ^http://|^https:// ]]; then
    server_address="http://$server_address"
fi

read -p "Enter Base16 key: " base16_key

echo "Connecting to server..."

# Start reading messages in the background
read_messages &

# Read and send user input messages
while IFS= read -r input; do
    send_message "$input"
done
