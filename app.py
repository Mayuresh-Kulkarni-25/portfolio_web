from flask import Flask, request, render_template, redirect, url_for, jsonify, session, flash
from pymongo import MongoClient
from functools import wraps
import hashlib
from bson import ObjectId
from datetime import timedelta

app = Flask(__name__)
app.secret_key = 'Platinum_MK'  # Change this to a secure secret key

# Configure session to expire when browser is closed and set a short timeout
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=30)  # 30 minutes timeout
app.config['SESSION_COOKIE_SECURE'] = False  # Set to True in production with HTTPS
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_EXPIRES'] = None  # Session cookie expires when browser closes

client = MongoClient('mongodb+srv://Mayuresh_Kulkarni:kRqiLDAhS8OsjN7P@clustermk.pmzfzra.mongodb.net/')
db = client['portfolio_db']
collection = db['contacts']

# Admin credentials (in production, use environment variables)
ADMIN_USERNAME = 'Mayuresh'
ADMIN_PASSWORD = '2547'  # Change this to a secure password

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'admin_logged_in' not in session:
            return redirect(url_for('admin_login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def index():
    # Clear admin session when returning to portfolio
    if 'admin_logged_in' in session:
        session.clear()
        flash('Admin session expired. Please login again to access admin panel.', 'info')
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

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            session['admin_logged_in'] = True
            session['login_time'] = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
            return redirect(url_for('admin_dashboard'))
        else:
            flash('Invalid username or password', 'error')
    
    return render_template('admin_login.html')

@app.route('/admin/logout')
def admin_logout():
    session.clear()  # Clear all session data
    return redirect(url_for('index'))

@app.route('/admin')
@login_required
def admin_dashboard():
    # Get all data from the database
    contacts = list(collection.find({}))
    return render_template('admin.html', contacts=contacts)

@app.route('/admin/edit/<contact_id>', methods=['GET', 'POST'])
@login_required
def edit_contact(contact_id):
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        message = request.form['message']
        
        collection.update_one(
            {'_id': ObjectId(contact_id)},
            {'$set': {'name': name, 'email': email, 'message': message}}
        )
        
        flash('Contact updated successfully!', 'success')
        return redirect(url_for('admin_dashboard'))
    
    contact = collection.find_one({'_id': ObjectId(contact_id)})
    if not contact:
        flash('Contact not found!', 'error')
        return redirect(url_for('admin_dashboard'))
    
    return render_template('edit_contact.html', contact=contact)

@app.route('/admin/delete/<contact_id>', methods=['POST'])
@login_required
def delete_contact(contact_id):
    try:
        result = collection.delete_one({'_id': ObjectId(contact_id)})
        if result.deleted_count > 0:
            flash('Contact deleted successfully!', 'success')
        else:
            flash('Contact not found!', 'error')
    except Exception as e:
        flash('Error deleting contact!', 'error')
    
    return redirect(url_for('admin_dashboard'))

@app.route('/admin/delete-multiple', methods=['POST'])
@login_required
def delete_multiple_contacts():
    contact_ids = request.form.getlist('contact_ids')
    if contact_ids:
        try:
            object_ids = [ObjectId(cid) for cid in contact_ids]
            result = collection.delete_many({'_id': {'$in': object_ids}})
            flash(f'{result.deleted_count} contacts deleted successfully!', 'success')
        except Exception as e:
            flash('Error deleting contacts!', 'error')
    else:
        flash('No contacts selected!', 'error')
    
    return redirect(url_for('admin_dashboard'))

@app.route('/api/data')
@login_required
def get_data():
    # API endpoint to get data as JSON
    data = list(collection.find({}))
    # Convert ObjectId to string for JSON serialization
    for item in data:
        item['_id'] = str(item['_id'])
    return jsonify(data)

@app.route('/return-to-portfolio')
def return_to_portfolio():
    # Clear admin session when returning to portfolio
    if 'admin_logged_in' in session:
        session.clear()
        flash('Admin session expired. Please login again to access admin panel.', 'info')
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)
