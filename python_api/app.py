from flask import Flask, jsonify, request
from model import db, User
from flask_cors import CORS
from flasgger import Swagger, swag_from
from sqlalchemy.exc import IntegrityError
import pyodbc


app = Flask(__name__)
CORS(app)

def get_connection():
    return pyodbc.connect(
        "DRIVER={ODBC Driver 17 for SQL Server};"
        "SERVER=(LOCALDB)\MSSQLLocalDB;"
        "DATABASE=test;"
        "Trusted_Connection=yes;"
    )

# Swagger setup
template = {
    "swagger": "2.0",
    "info": {
        "title": "User API",
        "description": "Flask API with Swagger UI",
        "version": "1.0.0"
    },
    "basePath": "/",
    "schemes": ["http"]
}
swagger = Swagger(app, template=template)



@app.route('/api/users', methods=['GET'])
@swag_from('docs/get_users.yml')
def get_users():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Users")
    users = []
    for row in cursor.fetchall():
        users.append({
            "Id": row[0],
            "Name": row[1],
            "Email": row[2]
        })
    cursor.close()
    conn.close()
    return jsonify(users)


@app.route('/api/users', methods=['POST'])
@swag_from('docs/add_user.yml')
def add_user():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")

    if not name or not email:
        return jsonify({"error": "Name and email are required"}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO Users (Name, Email) VALUES (?, ?)", (name, email))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "User added successfully!"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify({"message": "User added successfully"}), 201
@app.route('/api/users/<int:id>', methods=['PUT'])
@swag_from('docs/update_user.yml')
def update_user(id):
    data = request.get_json()
    print(data)
    namevar = data.get("name")
    emailvar = data.get("email")

    try:
        conn = get_connection()
        cursor = conn.cursor()
        query = """
            UPDATE Users
            SET Name = ?, Email = ?
            WHERE ID = ?
        """
        cursor.execute(query, (namevar, emailvar,id))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "User updated successfully"})
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Email already exists"}), 400

if __name__ == '__main__':
    #with app.app_context():
        #db.create_all()  # ensure tables exist
    app.run(debug=True)
