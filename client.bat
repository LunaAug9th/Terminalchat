@echo off

set "last_sent_message="
set "last_received_message="
set "server_address="
set "base16_key="

REM Function to send a message
:send_message
set "message=%~1"
if "%message%" == "%last_sent_message%" (
    echo The message is identical to the last sent message. Ignoring.
    goto :eof
)

set "last_sent_message=%message%"
for /f "delims=" %%A in ('echo %message% ^| certutil -encodehex -f - 2^>nul') do set "encoded_message=%%A"
set "url=%server_address%/send.%encoded_message%?key=%base16_key%"

curl -s -o nul -w "%%{http_code}" "%url%" > temp_response.txt
set /p response=<temp_response.txt

del temp_response.txt

if "%response%" == "200" (
    echo Message sent!
) else (
    echo Failed to send message. Status code: %response%
)
goto :eof

REM Function to read messages
:read_messages
set "url=%server_address%/read?key=%base16_key%"

:read_loop
for /f "delims=" %%A in ('curl -s "%url%"') do set "data=%%A"
if NOT "%data%" == "%last_received_message%" if NOT "%data%" == "%last_sent_message%" (
    set "last_received_message=%data%"
    for /f "delims=" %%B in ('echo %data% ^| certutil -decodehex -f - 2^>nul') do set "decoded_message=%%B"
    if "%errorlevel%" == "0" (
        echo RECEIVE: %decoded_message%
    ) else (
        echo RECEIVE: (invalid hex message)
    )
)

ping -n 1 -w 250 127.0.0.1 > nul
goto :read_loop

goto :eof

REM Main script
set /p "server_address=Enter server address: "
if not "%server_address:~0,7%" == "http://" if not "%server_address:~0,8%" == "https://" set "server_address=http://%server_address%"

set /p "base16_key=Enter Base16 key: "

echo Connecting to server...

REM Start reading messages in a new process
start cmd /c call "%~f0" :read_messages

REM Read and send user input messages
:input_loop
set /p "input=Message: "
call :send_message "%input%"
goto :input_loop
