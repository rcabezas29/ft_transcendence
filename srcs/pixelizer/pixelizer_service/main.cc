#include <drogon/drogon.h>
using namespace drogon;
int main()
{
    app().registerHandler(
        "/pixelizer",
        [](const HttpRequestPtr &req,
           std::function<void(const HttpResponsePtr &)> &&callback) {
            MultiPartParser fileUpload;

			if (fileUpload.parse(req) != 0) {
				auto resp = HttpResponse::newHttpResponse();
				resp->setBody("Error parsing the request");
                resp->setStatusCode(k400BadRequest);
                callback(resp);
                return;
			}
			
            if (fileUpload.getFiles().size() != 1)
            {
				LOG_INFO << fileUpload.getFiles().size(); 
                auto resp = HttpResponse::newHttpResponse();
                resp->setBody("Must only be one file");
                resp->setStatusCode(k403Forbidden);
                callback(resp);
                return;
            }
			

            auto &file = fileUpload.getFiles()[0];
			file.saveAs("image");
			int sys_call = system("./pixelizer ./uploads/image -m 1 -b -65 -c -10");

			if (sys_call < 0) {
				auto resp = HttpResponse::newHttpResponse();
				resp->setStatusCode(HttpStatusCode::k500InternalServerError);
				callback(resp);
				return ;
			}

			auto resp = HttpResponse::newFileResponse("./test.jpg");
            callback(resp);
        },
        {Post});

    LOG_INFO << "Server running on 127.0.0.1:8848";
    app()
        .setClientMaxBodySize(20 * 2000 * 2000)
        .setUploadPath("./uploads")
        .addListener("0.0.0.0", 3001)
        .run();
}
