# django-template-editor

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