# django-template-editor
`django-template-editor` is a [Django](https://www.djangoproject.com/) application/ UI tool to edit and save your templates.  

### Quick start
1. Add "editor" to your INSTALLED_APPS setting like this::
    ```
    INSTALLED_APPS = [
        ...
        'editor',
    ]
    ```

2. Include the template-editor URLconf in your project urls.py like this::

    path('template-editor/', include('editor.urls')),

3. Run `python manage.py collectstatic` to collect the static files into root static folder.

4. Run `python manage.py migrate` to create the template-editor models.

5. Start the development server and visit http://127.0.0.1:8000/template-editor/
   to start editing templates.


### Live application
[templateditor.herokuapp.com](https://templateditor.herokuapp.com)
![templateditor.herokuapp.com](https://i.imgur.com/ixPn47L.jpg)


### Changelog
[Here](https://github.com/wilspi/django-template-editor/releases)


### Template Support
Currently following templating libraries are supported:
* `jinja2`


### Development
* #### Setup

  * Install `nix`
  * Run
    ```buildoutcfg
    nix-shell --pure shell.nix
    ```

* #### Update requirements
    ```buildoutcfg
    pip install -r requirements.txt
    cd editor/frontend/ && npm install && cd -
    ```

* #### Run
  * Build js and run application
    ```buildoutcfg
    cd editor/frontend/ && npm run build && cd -
    python manage.py runserver
    ```
* #### Update pypi package
  ```buildoutcfg
  python setup.py sdist
  ```