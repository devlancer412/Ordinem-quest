import { addDoc, getDocs, query, serverTimestamp } from "firebase/firestore";
import { useEvents } from "hooks/useEvents";
import { questCollection } from "./config";
import { getData } from "./utils";

const { setQuests } = useEvents.getState();

export const updateQuests = async () => {
    const quests = getData(
        await getDocs(query(questCollection))
    );

    setQuests(quests.map((item: any) => item as Quest));
}

export const createQuest = async (data: Quest) => {
    await addDoc(questCollection, { ...data, createdTime: serverTimestamp() });
    await updateQuests();
}