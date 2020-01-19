# django-template-explorer

### Supports

*  Python `<= 3.8.0`
*  Django `<= 3.0.2`

### Development

#### Setup `pyenv`

* Install [`pyenv`](https://github.com/pyenv/pyenv) and [`pyenv-virtualenv`](https://github.com/pyenv/pyenv-virtualenv)
* Install python 3.8 and setup virtualenv `django-template-explore-dev`
  ```buildoutcfg
  pyenv install 3.8.0 --skip-existing
  pyenv virtualenv 3.8.0 django-template-explore-dev
  ```

#### Update requirements
  ```buildoutcfg
  pip install -r requirements.txt
  ```

#### Setup django app: `example`

* Apply migrations:
  ``` buildoutcfg
  python manage.py migrate
  ```
* Add test data (SQL dump)
  ```buildoutcfg
  
  ``` 
  
  
