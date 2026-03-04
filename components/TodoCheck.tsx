'use client';

export default function TodoCheck({
    id,
    isCompleted,
    toggleAction
}:{
    id:number,
    isCompleted:boolean,
    toggleAction:(id:number,isCompleted:boolean) => Promise<void>
}) {
    return (
        <input
            type="checkbox"
            checked={isCompleted}
            onChange={() => toggleAction(id,isCompleted)}//クライアント側で実行
            className="w-5 h-5 cursor-pointer"
        />    
    );
    
}