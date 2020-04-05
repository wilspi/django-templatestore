# django-templatestore
![Python application](https://github.com/wilspi/django-templatestore/workflows/Python%20application/badge.svg?branch=master)     

`django-templatestore` is a [Django](https://www.djangoproject.com/) application/ UI tool to edit and save your templates. 

Demo application:  [send_me_a_mail]()

### Quick start
Follow steps to quickly add `django-templatestore` to your existing django application:  
1. Install [`django-templatestore`](https://pypi.org/project/django-templatestore/0.1/)
    ```
    pip install django-templatestore
    ```
2. Add `templatestore` to your `INSTALLED_APPS` in `settings.py`:
    ```
    INSTALLED_APPS = [
        ...
        'templatestore',
    ]
    ```
3. Include the `templatestore` URLconf in your project's `urls.py`:
    ```
    path('templatestore/', include('templatestore.urls')),
    ```
4. Run `python manage.py collectstatic` to collect the static files into root static folder.
5. Run `python manage.py migrate` to create the `templatestore` models.
6. Start the development server and visit `http://127.0.0.1:8000/templatestore/`
   to start editing templates.


### Changelog
[Here](https://github.com/wilspi/django-templatestore/releases)


### Templating Library Support
Currently following templating libraries are supported:
 - [x] [`jinja2`](https://www.palletsprojects.com/p/jinja/)
 - [ ] [`handlebarsjs`](https://handlebarsjs.com/guide/)


### Share your screenshot
* [send_me_a_mail]()

[templateditor.herokuapp.com](https://templateditor.herokuapp.com)
![templateditor.herokuapp.com](https://i.imgur.com/ixPn47L.jpg)


### Development
* #### Setup

  * Install `nix`  
    Follow steps [here](https://gist.github.com/wilspi/aad81f832d030d80fca91dfa264a1f8a), if not done already
  * Run
    ```
    nix-shell --pure shell.nix
    ```
    * `shell.nix` is tested on `Arch Linux`, `Ubuntu`, `Macos`   
    Failing to run: please raise issue [here](/issues) :)

* #### Update requirements
  * `python`
    ```
    pip install -r requirements.txt # python
    ```
  * `node`
    ```
    cd templatestore/frontend/ && npm install && cd - # node packages
    ```

* #### Run
  * Build js and collect static files
    ```
    cd templatestore/frontend/ && npm run build && cd - && python manage.py collectstatic --noinput
    ```
  * Run application
    ```
    python manage.py runserver
    ```

  
