import React, { useState,useReducer } from "react";
import firebase, { db }  from "../../firebase"
import { useForm } from "react-hook-form";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import {
    Typography,
    Paper,
    Button,
    TextField,
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


  })
);

//state type
type State = {
  username: string,
  displayName:  string,
};

let initialState: State = {
  username: "",
  displayName: "",
};

type Action =
  | { type: "setUsername", payload: string }
  | { type: "setDisplayName", payload: string }
  | { type: "setIsError", payload: boolean };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "setUsername":
      return {
        ...state,
        username: action.payload
      };
    case "setDisplayName":
    return {
        ...state,
        displayName: action.payload
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


export const Create = () => {

    const classes = useStyles();//Material-ui
    const [state, dispatch] = useReducer(reducer, initialState);
    const [error, setError] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const { register, handleSubmit, errors ,formState} = useForm();
    const history = useHistory()

    async function handleOnSubmit (data) {  //react-hook-formを導入したためevent -> dataに変更
        const docId = db.collection("members").doc().id;

        let timestamp = firebase.firestore.FieldValue.serverTimestamp()
        db.collection("members").doc(docId).set({
            docId: docId,
            displayName: state.displayName,
            email: state.username,
            createdAt: timestamp,
        });

        setSuccessMessage("更新しました。")
        setTimeout(function(){
            console.log("リダレクト処理")
            history.push("/")
        },2000);        
        //登録後、Topに移動
        //this.props.history.push("/screens/");
    }

    const handleUsernameChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        dispatch({
            type: "setUsername",
            payload: event.target.value
        });
    };

    const handleDisplayNameChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        dispatch({
            type: "setDisplayName",
            payload: event.target.value
        });
    };    

    //あとで原因を調べる。わからない場合は別のツールを検討する
    formState.isSubmitted = false   //一回submittedになるとレンダリングが遅くなり、変な動きするので強制的にfalseにする

    return (
        <div className={classes.container} >
            <Typography variant="h4" align="center" component="h1" gutterBottom>
                新規作成
            </Typography>
            {error && <div style={{ color: "red" }}>{error}</div>}
            {successMessage && <div variant="danger">{successMessage}</div>}

            <form  noValidate autoComplete="off">
                <Paper style={{ padding: 16 }}>
                    <TextField
                        fullWidth
                        id="username"
                        name="username"
                        type="email"
                        label="Email"
                        //placeholder="Email"
                        margin="normal"
                        value={state.username}
                        onChange={handleUsernameChange}
                        inputRef={register({pattern: /^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]{1,}\.[A-Za-z0-9]{1,}$/ })}
                    />
                    {errors.username?.type === "pattern" &&
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



                    
                    <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        color="primary"
                        className={classes.updateProfileBtn}
                        onClick={handleSubmit(handleOnSubmit)}
                    >
                        新規作成
                    </Button>
                </Paper>

            </form>
            <Typography className={classes.subtitle2} variant="subtitle2"><Link to="/">一覧へ戻る</Link></Typography>

        </div>

    );
}



//export const ScreensCreate;
