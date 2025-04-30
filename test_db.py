from backend.db_manager import DatabaseManager
import os

def test_database():
    # Definim calea absoluta catre fisierul bazei de date
    current_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(current_dir, 'resources.db')
    
    print(f"Incercare conectare la baza de date: {db_path}")
    
    # Creeaza o conexiune la baza de date cu calea absoluta
    db = DatabaseManager(db_path)
    
    # Testeaza adaugarea unui utilizator
    user_id = db.add_user("test_user", "hashed_password", "test@example.com")
    print(f"Adaugat utilizator cu ID: {user_id}")
    
    # Testeaza adaugarea unei resurse
    resource_id = db.add_resource(
        title="Python Documentation",
        url="https://docs.python.org/",
        description="Official Python documentation",
        category="programming"
    )
    print(f"Adaugata resursa cu ID: {resource_id}")
    
    # Testeaza adaugarea unei preferinte
    success = db.add_user_preference(user_id, "programming")
    print(f"Adaugare preferinta: {'Succes' if success else 'Esec'}")
    
    # Verifica datele
    user = db.get_user_by_username("test_user")
    print(f"Utilizator gasit: {dict(user) if user else 'Nu'}")
    
    preferences = db.get_user_preferences(user_id)
    print(f"Preferinte utilizator: {preferences}")
    
    resources = db.get_resources_by_category("programming")
    print(f"Numar de resurse in categoria 'programming': {len(resources)}")
    
    db.close()

if __name__ == "__main__":
    test_database()