from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)  # Para que funcione con el cliente

# Crear base de datos
def crear_base_datos():
    conn = sqlite3.connect('mesas.db')
    cursor = conn.cursor()
    
    # Crear tabla
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS mesas (
            id INTEGER PRIMARY KEY,
            numero INTEGER,
            estado TEXT,
            mozo TEXT,
            clientes INTEGER,
            pedido TEXT,
            forma TEXT,
            color TEXT,
            posicion_top INTEGER,
            posicion_left INTEGER,
            ancho INTEGER,
            alto INTEGER
        )
    ''')
    
    # Ver si ya hay datos
    cursor.execute('SELECT COUNT(*) FROM mesas')
    if cursor.fetchone()[0] == 0:
        # Datos iniciales de las 10 mesas
        mesas = [
            (1, 'Ocupada', 'Laura', 3, 'Cafe doble, medialuna, jugo de naranja', 'redonda', 'azul', 80, 80, 80, 80),
            (2, 'Libre', None, 0, None, 'cuadrada', 'verde', 80, 220, 80, 80),
            (3, 'Ocupada', 'Carlos', 2, 'Capuchino, tostado', 'redonda', 'naranja', 80, 360, 80, 80),
            (4, 'Ocupada', 'Ana', 4, 'Cafe con leche x2, te x2', 'cuadrada', 'roja', 220, 100, 80, 80),
            (5, 'Libre', None, 0, None, 'redonda', 'violeta', 220, 240, 80, 80),
            (6, 'Ocupada', 'Miguel', 2, 'Espresso, agua mineral', 'cuadrada', 'turquesa', 220, 380, 80, 80),
            (7, 'Libre', None, 0, None, 'redonda', 'gris', 360, 80, 80, 80),
            (8, 'Ocupada', 'Sofia', 5, 'Cafe americano x3, sandwich x2', 'cuadrada', 'rosa', 360, 220, 80, 80),
            (9, 'Libre', None, 0, None, 'redonda', 'amarillo', 360, 360, 80, 80),
            (10, 'Ocupada', 'Diego', 6, 'Desayuno completo x6', 'cuadrada', 'azul', 240, 550, 120, 120),
        ]
        
        for mesa in mesas:
            cursor.execute('''
                INSERT INTO mesas (numero, estado, mozo, clientes, pedido, forma, color, 
                                 posicion_top, posicion_left, ancho, alto)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', mesa)
    
    conn.commit()
    conn.close()

# Crear la base de datos al iniciar
crear_base_datos()

# Obtener todas las mesas
@app.route('/api/mesas', methods=['GET'])
def obtener_mesas():
    conn = sqlite3.connect('mesas.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM mesas ORDER BY numero')
    mesas = cursor.fetchall()
    
    conn.close()
    
    # Convertir a lista de diccionarios
    resultado = []
    for mesa in mesas:
        resultado.append(dict(mesa))
    
    return jsonify(resultado)

# Obtener una mesa
@app.route('/api/mesas/<int:numero>', methods=['GET'])
def obtener_mesa(numero):
    conn = sqlite3.connect('mesas.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM mesas WHERE numero = ?', (numero,))
    mesa = cursor.fetchone()
    
    conn.close()
    
    if mesa:
        return jsonify(dict(mesa))
    else:
        return jsonify({'error': 'Mesa no encontrada'}), 404

# Actualizar una mesa
@app.route('/api/mesas/<int:numero>', methods=['PUT'])
def actualizar_mesa(numero):
    datos = request.get_json()
    
    conn = sqlite3.connect('mesas.db')
    cursor = conn.cursor()
    
    # Actualizar mesa
    cursor.execute('''
        UPDATE mesas 
        SET estado = ?, mozo = ?, clientes = ?, pedido = ?
        WHERE numero = ?
    ''', (datos['estado'], datos['mozo'], datos['clientes'], datos['pedido'], numero))
    
    conn.commit()
    conn.close()
    
    # Obtener mesa actualizada
    conn = sqlite3.connect('mesas.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM mesas WHERE numero = ?', (numero,))
    mesa = cursor.fetchone()
    conn.close()
    
    return jsonify(dict(mesa))

# Liberar una mesa
@app.route('/api/mesas/<int:numero>/liberar', methods=['POST'])
def liberar_mesa(numero):
    conn = sqlite3.connect('mesas.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        UPDATE mesas 
        SET estado = 'Libre', mozo = NULL, clientes = 0, pedido = NULL
        WHERE numero = ?
    ''', (numero,))
    
    conn.commit()
    conn.close()
    
    # Obtener mesa actualizada
    conn = sqlite3.connect('mesas.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM mesas WHERE numero = ?', (numero,))
    mesa = cursor.fetchone()
    conn.close()
    
    return jsonify(dict(mesa))

# Obtener estadisticas
@app.route('/api/estadisticas', methods=['GET'])
def obtener_estadisticas():
    conn = sqlite3.connect('mesas.db')
    cursor = conn.cursor()
    
    # Total mesas
    cursor.execute('SELECT COUNT(*) FROM mesas')
    total = cursor.fetchone()[0]
    
    # Mesas ocupadas
    cursor.execute("SELECT COUNT(*) FROM mesas WHERE estado = 'Ocupada'")
    ocupadas = cursor.fetchone()[0]
    
    # Total clientes
    cursor.execute('SELECT SUM(clientes) FROM mesas')
    clientes = cursor.fetchone()[0]
    if clientes is None:
        clientes = 0
    
    conn.close()
    
    resultado = {
        'total_mesas': total,
        'mesas_ocupadas': ocupadas,
        'mesas_libres': total - ocupadas,
        'total_clientes': clientes
    }
    
    return jsonify(resultado)

# Iniciar servidor
if __name__ == '__main__':
    print('Servidor corriendo en http://localhost:5000')
    app.run(debug=True, port=5000)
