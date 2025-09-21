class JsScanner {
    constructor(options) {
        this.API_URL = options.API_URL;
    }

	PostHttpRequest(t, e, n){
		var s = new XMLHttpRequest();
	  (s.onreadystatechange = function () {
		s.readyState == 4 &&
		  200 == s.status &&
		  e(JSON.parse(s.responseText), n);
	  }),
		s.open("POST", this.API_URL),
		s.setRequestHeader("Content-Type", "application/json;charset=UTF-8"),
		s.send(t);
        s.onerror = function(error){
            e({Command: 'RequestError', ErrorType: 'RequestError', ErrorCode: '4000', ErrorDescription: 'request error'}, n);
        }
	}

	PostHttpRequestSync(t) {
		  var e = new XMLHttpRequest();
		  return (
			e.open("POST", this.API_URL, !1),
			e.setRequestHeader("Content-Type", "application/json;charset=UTF-8"),
			e.send(t),
			JSON.parse(e.responseText)
		  );
	}
	GetDataSources(t, e){
		this.PostHttpRequest(JSON.stringify({ Command: "GetSources" }), t, e);
	}

	AcquireSync(t, e, n, s, o, u, i, r){
		u = {
		Command: "Acquire",
		ProductName: t,
		Duplex: e,
		Color: n,
		Resolution: s,
		Format: o,
		Blank: u,
	  };
	  this.PostHttpRequest(JSON.stringify(u), i, r);
	}

	AcquireAsync(t, e, n, s, o, u, i, r){
		  u = {
			Command: "AcquireAsync",
			ProductName: t,
			Duplex: e,
			Color: n,
			Resolution: s,
			Format: o,
			Blank: u,
		  };
		  return this.PostHttpRequestSync(JSON.stringify(u));
	}

	GetFileSync(t, e, n){
		t = { Command: "GetFileSync", FilePath: t };
		this.PostHttpRequest(JSON.stringify(t), e, n);
	}

	GetFileAsyncByIndex(t, e){
		  e = { Command: "GetFileAsyncByIndex", Guid: t, Index: e };
		  return this.PostHttpRequestSync(JSON.stringify(e));
	}

	GetFileAsyncByPath(t, e){
	  e = { Command: "GetFileAsyncByPath", Guid: t, FilePath: e };
	  return this.PostHttpRequestSync(JSON.stringify(e));
	}

	GetProductVersion(){
	  var t = { Command: "GetProductVersion" };
	  return this.PostHttpRequestSync(JSON.stringify(t));
	}

	QueryResult(t){
      t = { Command: "QueryResult", Guid: t };
	  return this.PostHttpRequestSync(JSON.stringify(t));
	}

	GetProductInfo(t, e, n){
	  t = { Command: "GetProductInfo", ProductName: t };
	  this.PostHttpRequest(JSON.stringify(t), e, n);
	}

	DeleteAcquireFiles(t){
	  t = { Command: "DeleteAcquireFiles", Guid: t };
	  return this.PostHttpRequestSync(JSON.stringify(t));
    }
}

export default JsScanner;