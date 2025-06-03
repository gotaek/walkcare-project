exports.handler = async (event) => {
  const code = event.queryStringParameters?.code || "";

  const html = `
      <!DOCTYPE html>
      <html lang="ko">
        <head>
          <meta charset="UTF-8" />
          <title>Fitbit 로그인 중</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 2rem; }
          </style>
        </head>
        <body>
          <h2>WalkCare 로그인 중...</h2>
          <p>잠시만 기다려 주세요</p>
          <script>
            window.ReactNativeWebView?.postMessage("${code}");
          </script>
        </body>
      </html>
    `;

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/html" },
    body: html,
  };
};
