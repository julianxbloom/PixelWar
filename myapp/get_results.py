import mysql.connector, csv

def singleUserDataTreatment(user: tuple):
    """Extrait les données d'un utilisateur."""
    if not user[0] or not user[1]:
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
        pixelsColored = user[1]
        if username == 'tim':
            classe = 'TG02'
            pixelsColored -= 500
        return username, pixelsColored, classe
    
    else:
        return False


def getResultatsIndiv():
    """Renvoie les résultats statistiques de la Pixel War par utilisateur."""
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


def getResultatsParClasse():
    """Renvoie les résultats statistiques de la Pixel War par classe."""
    resultatsIndiv = getResultatsIndiv()
    results = {}
    
    for user in resultatsIndiv:
        if user[2] not in results:
            results[user[2]] = user[1]
        else:
            results[user[2]] += user[1]
    
    return results


def resultatsIndivToCSV():
    """Ajoute les résultats par utilisateurs dans un fichier csv."""
    resultatsIndiv = getResultatsIndiv()
    
    with open('resultats/resultsIndiv.csv', 'w') as csvFile:
        fieldnames = ['username', 'pixelsColored', 'class']
        writer = csv.DictWriter(csvFile, fieldnames=fieldnames)
        
        writer.writeheader()
        for ele in resultatsIndiv:
            writer.writerow(
                {'username': ele[0],
                 'pixelsColored': ele[1],
                 'class': ele[2]
                })
    return 1


def resultatsParClasseToCSV():
    """Ajoute les résultats par classe dans un fichier csv."""
    resultatsParClasse = getResultatsParClasse()
    
    with open('resultats/resultsClasse.csv', 'w') as csvFile:
        fieldnames = ['classe','pixelsColored']
        writer = csv.DictWriter(csvFile, fieldnames=fieldnames)
        
        writer.writeheader()
        
        for ele in resultatsParClasse:
            writer.writerow(
                    {'classe':ele,
                    'pixelsColored': resultatsParClasse[ele]
                })
    return 1


resultatsParClasseToCSV()
resultatsIndivToCSV()