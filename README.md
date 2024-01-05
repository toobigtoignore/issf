## ISSF Frontend

The repository is made with Angular. 

### Installation

1. Clone or download the folder
2. Run `npm install`
3. Start localhost by running `ng serve`
4. Visit `http://localhost:4200` on your browser. 


**Note:** If you have downloaded the folder instead of cloning it from your terminal, you may have to `cd` to the folder and run `git init` to initialize it as a git repo.


### Upload to Server

Once your code is submitted and merged with the master branch, you can upload the files to the server. 
Create the distribution files by running 

`npm build --configuration=production`

Once the build process is completed, upload the files in the `dist` folder to the server. For security purposes, please contact the team lead for credentials needed to upload the files.


## ISSF Backend

Made with Laravel

### Installation

Once you have cloned the repository, you can run:

`php artisan serve`

The development server should start on `http://127.0.0.1:8000`. 

Note: you need to have Laravel downloaded on your computer. Please refer to Laravel documentation for installing Laravel on your computer:
`https://laravel.com/docs/10.x/installation`
