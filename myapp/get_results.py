import mysql.connector

def get_results():
    with mysql.connector.connect(
        host="yamanote.proxy.rlwy.net",
        port=30831,
        user="root",
        password="yMdXBhOeslFOqRfhbbHUWUlijPQZtLlI"
        ):
        
        print("connected")
        
        query = "SELECT username, pixelcolored FROM users"
        

get_results()