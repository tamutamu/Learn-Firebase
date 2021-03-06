import React, { useState,useReducer,useEffect } from "react";
import firebase, { db }  from "../../firebase"
import { useForm } from "react-hook-form";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import {
    Typography,
    Paper,
    Button,
    TextField,
    InputLabel,
    MenuItem,
    Select,
  } from '@material-ui/core';
import { Link , useHistory} from "react-router-dom"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
        padding: 16, 
        margin: 'auto',
        maxWidth: 480
    },
    updateProfileBtn: {
      marginTop: theme.spacing(2),
      flexGrow: 1,
      color:'primary'
    },
    imagephotoURL: {
        width: "80%",
        margin: '10px',
        borderRadius: '50%'
    },
    inputFile: {
        display: "none"
    },
    subtitle2: {
        color:"#757575"
    },
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paper: {
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
    inputFilebtn: {
        position: "absolute",
        top: "80%",
        left: "55%",
    },
    InputLabel:{
        marginTop: '10px',
    }

  })
);

//state type
type State = {
  email: string,
  displayName:  string,
  departmentId:  string,
};

let initialState: State = {
  email: "",
  displayName: "",
  departmentId: "",
};

type Action =
  | { type: "setEmail", payload: string }
  | { type: "setDisplayName", payload: string }
  | { type: "setDepartment", payload: string }
  | { type: "setIsError", payload: boolean };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "setEmail":
      return {
        ...state,
        email: action.payload
      };
    case "setDisplayName":
    return {
        ...state,
        displayName: action.payload
    };
    case "setDepartment":
    return {
        ...state,
        departmentId: action.payload + ""
    };

    case "setIsError":
      return {
        ...state,
        isError: action.payload
      };
    default:
       return state;
  }
};


export const Edit = (props) => {

    //更新時の処理
    const docId  = props.match.params.docId   //画面からわたってきたパラメータ

    const classes = useStyles();//Material-ui
    const [state, dispatch] = useReducer(reducer, initialState);
    const [error, setError] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const { register, handleSubmit, errors ,formState} = useForm();
    const history = useHistory()
    const [departmentList, setDepartmentList] = useState([])
    useEffect(() => {
        async function fetchData() { 
            console.log("render")
            console.log(docId)
            if (docId){
                await db.collection("members").where("docId", "==", docId)
                .get()
                .then(function(querySnapshot) {
                    querySnapshot.forEach(function(doc) {
                        // doc.data() is never undefined for query doc snapshots
                        dispatch({
                            type: "setEmail",
                            payload: doc.data().email
                        });
                        dispatch({
                            type: "setDisplayName",
                            payload: doc.data().displayName
                        });
                        dispatch({
                            type: "setDepartment",
                            payload: doc.data().departmentId 
                        });
                        console.log("データ読み込み内部のrender")

                    });
                })
                .catch(function(error) {
                    console.log("Error getting documents: ", error);
                });
            }    
        }

        async function departmentData() { 
            const colRef = db.collection("departments")
            .orderBy('departmentId');

            const snapshots = await colRef.get();
            var docs = snapshots.docs.map(function (doc) {
                return doc.data();
            });
            setDepartmentList(docs)
        }

        departmentData();    //部署データ読み込み(セレクトボックスで使う方を先に読み込む)
        fetchData();
    },[docId]);

    async function handleCreate () {  //react-hook-formを導入したためevent -> dataに変更
        const docId = db.collection("members").doc().id;

        let timestamp = firebase.firestore.FieldValue.serverTimestamp()
        db.collection("members").doc(docId).set({
            docId: docId,
            displayName: state.displayName,
            email: state.email,
            departmentId: state.departmentId,
            createdAt: timestamp,
            updatedAt: timestamp,
        });

        setSuccessMessage("更新しました。")
        setTimeout(function(){
            console.log("リダレクト処理")
            history.push("/screens/index")
        },2000);        
    }

    async function handleUpdate () {  //react-hook-formを導入したためevent -> dataに変更
        console.log("update proc start")
        setSuccessMessage("")
        setError("")
        console.log("state",state)

        let timestamp = firebase.firestore.FieldValue.serverTimestamp()
        db.collection("members").doc(docId).update({
            displayName: state.displayName,
            email: state.email,
            departmentId: state.departmentId,
            updatedAt: timestamp,
        });

        setSuccessMessage("更新しました。")
        setTimeout(function(){
            console.log("リダレクト処理")
            history.push("/screens/index")
        },2000);

        console.log("update proc end")
    }

    async function handleDelete (data) {  //react-hook-formを導入したためevent -> dataに変更

        if (window.confirm('削除しますか？')) {
            db.collection("members").doc(docId).delete();
            setSuccessMessage("削除しました")
            setTimeout(function(){
                console.log("リダレクト処理")
                history.push("/screens/index")
            },2000);
        }
    }


    const handleEmailChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        dispatch({
            type: "setEmail",
            payload: event.target.value
        });
    };

    const handleDisplayNameChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        dispatch({
            type: "setDisplayName",
            payload: event.target.value
        });
    };    

    const handleDepartmentChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        dispatch({
            type: "setDepartment",
            payload: event.target.value
        });
    };
    //あとで原因を調べる。わからない場合は別のツールを検討する
    formState.isSubmitted = false   //一回submittedになるとレンダリングが遅くなり、変な動きするので強制的にfalseにする

    return (
        <div className={classes.container} >
            <Typography variant="h4" align="center" component="h1" gutterBottom>
                {docId && <>XXX更新</>}
                {!docId && <>XXX新規作成</>}
            </Typography>
            {error && <div style={{ color: "red" }}>{error}</div>}
            {successMessage && <div variant="danger">{successMessage}</div>}

            <form  noValidate autoComplete="off">
                <Paper style={{ padding: 16 }}>
                    <TextField
                        fullWidth
                        id="email"
                        name="email"
                        type="email"
                        label="Email"
                        //placeholder="Email"
                        margin="normal"
                        value={state.email}
                        onChange={handleEmailChange}
                        inputRef={register({pattern: /^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]{1,}\.[A-Za-z0-9]{1,}$/ })}
                    />
                    {errors.email?.type === "pattern" &&
                    <div style={{ color: "red" }}>メールアドレスの形式で入力されていません</div>}

                    <TextField
                        fullWidth
                        id="displayName"
                        name="displayName"
                        type="text"
                        label="表示名"
                        placeholder="ハンドル名を入力してください"
                        margin="normal"
                        value={state.displayName}
                        onChange={handleDisplayNameChange}
                        inputRef={register({ required: true, minLength: 4 })}
                    />
                    {errors.displayName?.type === "required" &&
                    <div style={{ color: "red" }}>表示名を入力してください</div>}
                    {errors.displayName?.type === "minLength" &&
                    <div style={{ color: "red" }}>表示名は4文字以上で入力してください</div>}

                    {departmentList && <>
                        <InputLabel className={classes.InputLabel} id="department-select-label">部署</InputLabel>
                        <Select
                            fullWidth
                            labelId="department-select-label"
                            id="department-select"
                            value={state.departmentId}
                            onChange={handleDepartmentChange}
                            defaultValue={"0001"}
                        >
                            {
                                departmentList.map((item,index) => {
                                    return (
                                        <MenuItem key={item.departmentName} value={ item.departmentId }   >
                                            {item.departmentName}:
                                        </MenuItem>
                                    )
                                })
                            }
                            <MenuItem key={"9999"} value={"9999"} >未所属</MenuItem>
                        </Select>
                    </>
                    }        
                    {docId && 
                    <>
                        <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        color="primary"
                        className={classes.updateProfileBtn}
                        onClick={handleSubmit(handleUpdate)}
                        >
                        更新
                        </Button>

                        <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        color="secondary"
                        className={classes.updateProfileBtn}
                        onClick={handleSubmit(handleDelete)}
                        >
                        削除
                        </Button>
                    </>
                    }
                    {!docId && 
                        <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        color="primary"
                        className={classes.updateProfileBtn}
                        onClick={handleSubmit(handleCreate)}
                    >
                        新規作成
                    </Button>
                    }

                    
                </Paper>

            </form>
            <Typography className={classes.subtitle2} variant="subtitle2"><Link to="/screens/index">一覧に戻る</Link></Typography>
            <Typography className={classes.subtitle2} variant="subtitle2"><Link to="/">Homeに戻る</Link></Typography>
        </div>

    );
}



//export const ScreensCreate;

