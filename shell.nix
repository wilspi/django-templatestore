let
  # Update nixpkgs from release: https://github.com/NixOS/nixpkgs/releases/tag/19.09
  nixpkgs = import (builtins.fetchTarball https://github.com/NixOS/nixpkgs/archive/19.09.tar.gz) {
    overlays = [];
    config = {};
  };

  installNodeJS = import (./nodejs.nix) {
    inherit nixpkgs;
    version = "13.6.0";
    sha256 = "${if nixpkgs.stdenv.isDarwin then "0z64v76w8x02yg2fz2xys580m9mlwklriz1s5b0rxn569j4kwiya" else "166pm67i7qys3x6x1dy5qr5393k0djb04ylgcg8idnk7m0ai7w00"}";
  };
  frameworks = nixpkgs.darwin.apple_sdk.frameworks;


in
  with nixpkgs;

  stdenv.mkDerivation {
    name = "django-templatestore-dev";
    buildInputs = [ installNodeJS ];

    nativeBuildInputs = [
      file
      zsh
      wget
      locale
      vim
      less
      htop
      curl
      man
      git
      gitAndTools.diff-so-fancy
      heroku
      openssl
      pkgconfig
      perl
      nixpkgs-fmt
      geos
      gdal

      postgresql_11
      python37
      python37Packages.virtualenv
      cacert
    ] ++ (
      stdenv.lib.optionals stdenv.isDarwin [
        frameworks.Security
        frameworks.CoreServices
        frameworks.CoreFoundation
        frameworks.Foundation
      ]
    );

    # ENV Variables
    HISTFILE = "${toString ./.}/.zsh-history";
    SOURCE_DATE_EPOCH = 315532800;
    LIBCLANG_PATH = "${llvmPackages.libclang}/lib";
    LD_LIBRARY_PATH = "${geos}/lib:${gdal}/lib";


    # Post Shell Hook
    shellHook = ''
      echo "Using ${python37.name}, and ${postgresql_11.name}."
      [ ! -d '$PROJDIR/django-templatestore-dev' ] && virtualenv django-templatestore-dev && echo "SETUP django-templatestore-dev: DONE"
      source django-templatestore-dev/bin/activate
      pip install -r requirements.txt
      # cd templatestore/frontend/ && npm install && npm run build && cd -
      echo "ENV: django-templatestore-dev ACTIVATED";
    '';
  }
