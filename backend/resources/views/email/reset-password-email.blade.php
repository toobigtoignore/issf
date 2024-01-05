
<html>
<head>
    <style>
    .reset-password-email-body {
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


    .reset-password-email-body h2 {
        color: #2699FB;
        font-size: 23px;
        line-height: 30px;
    }


    .reset-password-email-body p {
        margin: 10px 0px;
    }


    .reset-password-email-body strong {
        color: #2699FB;
        font-size: 25px;
    }
    </style>
</head>

<body>
    <div class="reset-password-email-body">
        <h2>Information System for Small-scale Fisheries (ISSF)</h2>
        <p>You're receiving this email because you requested to reset your password for your ISSF account.</p>
        <p>Please find your verification code below:</p>
        <br>

        <p>
            <strong>{{ $verification_code }} </strong>
        </p>

        <p>Thank you for using {{ $app_name }}!</p>
        <p>The {{ $app_name }} team</p>
    </div>
</body>
</html>
