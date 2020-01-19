let
  # Update nixpkgs from release: https://github.com/NixOS/nixpkgs/releases/tag/19.09
  nixpkgs = import (builtins.fetchTarball https://github.com/NixOS/nixpkgs/archive/19.09.tar.gz) {
    overlays = [];
    config = {};
  };

  installNodeJS = import (./nodejs.nix) {
    inherit nixpkgs;
    version = "13.6.0";
    sha256 = "00f01315a867da16d1638f7a02966c608e344ac6c5b7d04d1fdae3138fa9d798";
  };
  frameworks = nixpkgs.darwin.apple_sdk.frameworks;


in
  with nixpkgs;

  stdenv.mkDerivation {
    name = "django-template-explorer-dev";
    buildInputs = [installNodeJS];

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

      postgresql_11
      python37
      python37Packages.psycopg2
      python37Packages.pre-commit
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
    HISTFILE = "${toString ./.}/.zsh_history";
    SOURCE_DATE_EPOCH = 315532800;
    LIBCLANG_PATH = "${llvmPackages.libclang}/lib";

    # Post Shell Hook
    shellHook = ''
      echo "Using ${python37.name}, and ${postgresql_11.name}."
    '' + (
      if !pkgs.stdenv.isDarwin then
        ""
      else ''
        # Do something if required.
        ''
    ) + ''
      echo "env: [DEV] DJANGO-TEMPLATE-ENGINE activated";
    '';
  }