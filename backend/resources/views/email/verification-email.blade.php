
<html>
<head>
    <style>
    .registration-email-body {
        font-size: 15px;
        font-family: 'helvetica';
        max-width: 550px;
        padding: 20px 25px;
        margin: 30px auto;
        border: 1px solid #e3e3e3;
        box-shadow: 1px 1px 10px 0px rgba(0,0,0,.1);
        text-align: center;
        border-radius: 5px;
    }


    .registration-email-body h2 {
        color: #2699FB;
        font-size: 23px;
        line-height: 30px;
    }


    .registration-email-body p {
        margin: 10px 0px;
    }


    .registration-email-body .activation-link {
        background: #2699FB;
        color: white;
        text-decoration: none;
        border-radius: 5px;
        padding: 10px 100px;
        text-align: center;
    }
    </style>
</head>

<body>
    <div class="registration-email-body">
        <h2>Information System for Small-scale Fisheries (ISSF)</h2>
        <p>You're receiving this email because you need to finish activation process on {{ $app_name }}.</p>
        <p>Please click on the button below to activate your account:</p>
        <br>

        <a href="{{ env('APP_URL') }}/authentication/activate/{{ $user_id }}/{{ $token }}" class="activation-link">
            Activate Account
        </a>

        <br><br>
        <p>Thank you for using {{ $app_name }}!</p>
        <p>The {{ $app_name }} team</p>
    </div>
</body>
</html>
