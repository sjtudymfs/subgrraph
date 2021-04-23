from flask import Flask,render_template,request,jsonify
from subMatch import dealMatch
import random

app = Flask(__name__)

# 通过 static_folder 指定静态资源路径，以便 index.html 能正确访问 CSS 等静态资源
# template_folder 指定模板路径，以便 render_template 能正确渲染 index.html
'''
app = Flask(
    __name__, static_folder="../dist/static", template_folder="../dist")
'''


@app.route('/')
def index():
    '''
        当在浏览器访问网址时，通过 render_template 方法渲染 dist 文件夹中的 index.html。
        页面之间的跳转交给前端路由负责，后端不用再写大量的路由
    '''
    return render_template("subgraph.html")


@app.route('/getMatch', methods=['POST'])
def getMatch():

    if request.method == "POST":

        getGraph=request.get_json(force=True)
        print(getGraph)
        targetGraph={"nodes":[],"links":[]}
        for node in getGraph["nodes"]:
            tmp={'id':int(node["name"]),'label':random.choice(['A','B'])}
            targetGraph['nodes'].append(tmp)
        for edge in getGraph["links"]:
            tmp={"start":int(edge["source"]),"end":int(edge["target"])}
            targetGraph['links'].append(tmp)
        print(targetGraph)
        
        graphList=dealMatch(targetGraph)
        matchedGraph={"sub":[],"links":getGraph["links"]}
        for sub in graphList:
            tmp=list(sub)
            matchedGraph['sub'].append(tmp)
        return jsonify(matchedGraph)


if __name__ == '__main__':
    app.run(debug=True)
