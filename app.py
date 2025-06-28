from flask import Flask, request, render_template, redirect, url_for
from pymongo import MongoClient

app = Flask(__name__)
client = MongoClient('mongodb+srv://Mayuresh_Kulkarni:kRqiLDAhS8OsjN7P@clustermk.pmzfzra.mongodb.net/')
db = client['portfolio_db']
collection = db['contacts']

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/submit', methods=['POST'])
def submit():
    name = request.form['name']
    email = request.form['email']
    message = request.form['message']

    collection.insert_one({
        'name': name,
        'email': email,
        'message': message
    })

    return redirect(url_for('thank_you'))

@app.route('/thankyou')
def thank_you():
    return render_template('thankyou.html')

if __name__ == '__main__':
    app.run
