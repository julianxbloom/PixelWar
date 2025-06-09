import mysql.connector

def singleUserDataTreatment(user: tuple):
    if not user[0]:
        return False
    
    num_classe = user[0][-2:]
            
    #classe = Autres
    if num_classe == 'es':
        classe = 'Autres'
        username = user[0][:-6]
        return username, user[1], classe
    elif num_classe == 'fs':
        classe = 'Profs'
        username = user[0][:-5]
        return username, user[1], classe
    
    # autres cas
    classe = user[0][-4:-2]
    if classe == 'GT':
        classe = '2GT' + num_classe
        username = user[0][:-5]
        return username, user[1], classe
    
    elif classe in ['1G', 'TG']:
        classe += num_classe
        username = user[0][:-4]
        if username == 'tim':
            classe = 'TG02'
        return username, user[1], classe
    
    else:
        return False


def getResults():
    with mysql.connector.connect(
        host="yamanote.proxy.rlwy.net",
        port=30831,
        database="railway",
        user="root",
        password="yMdXBhOeslFOqRfhbbHUWUlijPQZtLlI"
        ) as conn:
        
        cur = conn.cursor()
        
        query = "SELECT users, nbrColor FROM user"
        cur.execute(query)
        data = cur.fetchall()
        
        results = []
        
        for user in data:
            result = singleUserDataTreatment(user)
            if result:
                results.append(result)
            
        return results

def resultatsParClasse():
    resultatsIndiv = getResults()
    
    results = {}
    
    for user in resultatsIndiv:
        if user[2] not in results:
            results[user[2]] = user[1]
        else:
            results[user[2]] += user[1]
    return results

print(resultatsParClasse())