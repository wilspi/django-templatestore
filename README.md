# django-template-editor

### Supports

*  Python `<= 3.7.4`
*  Django `<= 3.0.2`
*  React `<= `

### Development

#### Setup

* Install [`pyenv`](https://github.com/pyenv/pyenv) and [`pyenv-virtualenv`](https://github.com/pyenv/pyenv-virtualenv)
* Install python 3.7.4 and setup virtualenv `django-template-explore-dev`
  ```buildoutcfg
  pyenv install 3.7.4 --skip-existing
  pyenv virtualenv 3.7.4 django-template-editor-dev
  ```
* Install `npm`
  ```buildoutcfg
  # specify version
  ```

####  OR

* Install `nix`
* Run
  ```buildoutcfg
  nix-shell --pure shell.nix
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
  
  
