# django-template-editor
`django-template-editor` is a [Django](https://www.djangoproject.com/) application/ UI tool to edit and save your templates.  

### Quick start
1. Install [`django-template-editor`](https://pypi.org/project/django-template-editor/0.1/)
    ```
    pip install django-template-editor
    ```
2. Add `editor` to your `INSTALLED_APPS` setting like this::
    ```
    INSTALLED_APPS = [
        ...
        'editor',
    ]
    ```
3. Include the template-editor URLconf in your project urls.py like this::
    ```
    path('template-editor/', include('editor.urls')),
    ```
4. Run `python manage.py collectstatic` to collect the static files into root static folder.
5. Run `python manage.py migrate` to create the template-editor models.
6. Start the development server and visit `http://127.0.0.1:8000/template-editor/`
   to start editing templates.


### Changelog
[Here](https://github.com/wilspi/django-template-editor/releases)


### Template Support
Currently following templating libraries are supported:
* [`jinja2`](https://www.palletsprojects.com/p/jinja/)



### Demo
[templateditor.herokuapp.com](https://templateditor.herokuapp.com)
![templateditor.herokuapp.com](https://i.imgur.com/ixPn47L.jpg)


### Development
* #### Setup

  * Install `nix`
  * Run
    ```
    nix-shell --pure shell.nix
    ```

* #### Update requirements
    ```
    pip install -r requirements.txt # python
    cd editor/frontend/ && npm install && cd - # node packages
    ```

* #### Run
  * Build js 
    ```
    cd editor/frontend/ && npm run build && cd -
    ```
  * Collect static files
    ```
    python manage.py collectstatic
    ```
  * Run application
    ```
    python manage.py runserver
    ```
* #### Update pypi package
  ```
  python setup.py sdist
  ```
  
