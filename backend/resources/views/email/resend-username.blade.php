
<html>
<head>
    <style>
    .resend-username-body {
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


    .resend-username-body h2 {
        color: #2699FB;
        font-size: 23px;
        line-height: 30px;
    }


    .resend-username-body p {
        margin: 10px 0px;
    }
    </style>
</head>

<body>
    <div class="resend-username-body">
        <h2>Information System for Small-scale Fisheries (ISSF)</h2>
        <p>Hi there,</p>
        <p>Your username to login to your ISSF account is: <strong>{{ $username }}</strong></p>
        <p>Thank you for using {{ $app_name }}!</p>
        <p>The {{ $app_name }} team</p>
    </div>
</body>
</html>
