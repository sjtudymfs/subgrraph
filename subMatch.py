import operator
import copy
import json
import time

subgraphCanList=[]
subgraphCanLink=[]

#计算图各节点度数
def calDeg(graph):
    num=len(graph['nodes'])
    deg=[0]*num
    for edge in graph['links']:
        deg[edge['start']]+=1
        deg[edge['end']]+=1
    return deg

#对于查询图中每个节点，依次判断目标图中各节点是否为候选节点，给出候选节点集
def genVerCanList(t,s,degT,degS):
    vertex_set_list=[]
    for vert in t['nodes']:
        vertex_set_list.append([str(vert['id'])])
        for vers in s['nodes']:
            if degT[vert['id']]<=degS[vers['id']] and vert['label']==vers['label']:
                vertex_set_list[vert['id']].append(vers['id'])
    return vertex_set_list

#对候选节点集根据候选节点数目进行排序
def takeLen(elem):
    return len(elem)

#获得图各节点邻居节点
def getVerNei(graph):
    neiList=[]
    for ver in graph['nodes']:
        neiList.append([])

    for edge in graph['links']:
        if edge['end'] not in neiList[edge['start']]:
            neiList[edge['start']].append(edge['end'])
        if edge['start'] not in neiList[edge['end']]:
            neiList[edge['end']].append(edge['start'])
    return neiList

'''
#相同邻居过滤函数
def sameNeiFil(startVer,curVer,verList,verNei):
    verNeiList=[]
    #判断哪些节点与开始节点具有相同邻居节点
    for startVerNei in verNei[startVer]:
        for i in range(1,len(verNei)):
            if startVerNei in verNei[i] and i!=startVer and curVer in verList[i]:
                verList[i].remove(curVer)     #删除与开始节点具有相同邻居节点列中与当前节点一样的候选节点
                verNeiList.append(i)

    print(verList)
    print(verNeiList)

    return verNeiList
'''

#去掉候选节点集中的全部当前节点，以及连接状态过滤
def pruVerSet(curVer,oldList,souNei,tarNei):
    verList=copy.deepcopy(oldList)
    if len(verList)!=1:
        for i in range(1,len(verList)):
            if curVer in verList[i]:
                verList[i].remove(curVer)
        '''
        for vert in tarNei[int(verList[0][0])]:
            index=0
            for i in range(1,len(verList)):
                if verList[i][0]==str(vert):
                    index=i
                    break
            tmp=[verList[index][0]]
            for vers in souNei[curVer]:
                if vers in verList[index]:
                    tmp.append(vers)
            verList[index]=tmp
        '''
        for i in range(1,len(verList)):
            if len(verList[i])>1:
                tmp=[verList[i][0]]
                if int(verList[i][0]) in tarNei[int(verList[0][0])]:
                    for j in range(1,len(verList[i])):
                        if verList[i][j] in souNei[curVer]:
                            tmp.append(verList[i][j])
                else:
                    for j in range(1,len(verList[i])):
                        if verList[i][j] not in souNei[curVer]:
                            tmp.append(verList[i][j])
                verList[i]=tmp

    del verList[0]
    return verList

#循环过滤函数
def filterLoop(verList,subgraph,sublink,souNei,tarNei):
    if len(verList)==1 and len(verList[0])>1:
        for i in range(1,len(verList[0])):
            addSub=copy.deepcopy(subgraph)
            addlink=copy.deepcopy(sublink)
            #addSub[verList[0][0]]=verList[0][i]
            addSub.add(verList[0][i])
            addlink[int(verList[0][0])]=verList[0][i]
            if addSub not in subgraphCanList:
                subgraphCanList.append(addSub)
                subgraphCanLink.append(addlink)
        #print(len(subgraphCanList))
        return 0
    
    for i in range(1,len(verList[0])):
        addSub=copy.deepcopy(subgraph)
        addlink=copy.deepcopy(sublink)
        #addSub[verList[0][0]]=verList[0][i]
        addSub.add(verList[0][i])
        addlink[int(verList[0][0])]=verList[0][i]

        #相同邻居过滤：找当前目标图节点的邻居节点，删除候选节点集中所有邻居节点的 与当前查询图节点相同的节点
        sameNeiVer=[]
        for j in range(0,len(tarNei)):
            if (j!=int(verList[0][0]) and len(tarNei[j])==len(tarNei[int(verList[0][0])])):
                flag=0
                for ver in tarNei[j]:
                    if ver not in tarNei[int(verList[0][0])]:
                        flag=1
                        break
                if flag==0:
                    sameNeiVer.append(j)
        
        for ver in verList:
            if (int(ver[0]) in sameNeiVer and verList[0][i] in ver):
                ver.remove(verList[0][i])

        #print(verList)

        #生成新的邻居节点集
        newTar=copy.deepcopy(tarNei)
        for ver in newTar[int(verList[0][0])]:
            newTar[ver].remove(int(verList[0][0]))
            newTar[int(verList[0][0])].remove(ver)

        #去掉全部当前节点
        newVerList=pruVerSet(verList[0][i],verList,souNei,tarNei)
        newVerList.sort(key=takeLen)

        if (len(newVerList[0])==1):
            continue

        filterLoop(newVerList,addSub,addlink,souNei,newTar)

    return 0

def dealMatch(targetGraph):
    subgraphCanList.clear()
    #with open('marieboucher.json','r',encoding='utf8')as fp:
    #with open('CA1.json','r',encoding='utf8')as fp:
    with open('netscience.json','r',encoding='utf8')as fp:
        sourceGraph=json.load(fp)
        #print(sourceGraph)
        #print(len(sourceGraph['nodes']))

    #计算两图节点数
    verSourNum=len(sourceGraph['nodes'])
    verTarNum=len(targetGraph['nodes'])

    #存储各节点的度数
    degSource=calDeg(sourceGraph)
    degTarget=calDeg(targetGraph)

    #生成候选节点子集并按长度进行排序   [['1',2,4,3],['2']]
    verCanList=genVerCanList(targetGraph,sourceGraph,degTarget,degSource)
    verCanList.sort(key=takeLen)

    #生成邻居节点集   [[1,2,3],[3,4,6]]
    souVerNei=getVerNei(sourceGraph)
    tarVerNei=getVerNei(targetGraph)

    #计时开始
    time_start=time.time()

    #subgraph={}
    subgraph=set()
    sublink=[-1]*verTarNum
    filterLoop(verCanList,subgraph,sublink,souVerNei,tarVerNei)
    print(subgraphCanList)
    print(len(subgraphCanList))

    time_end=time.time()
    print('time cost',time_end-time_start,'s')

    return subgraphCanLink