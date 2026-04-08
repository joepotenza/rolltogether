/*
  useLoadMonitor.js
  Custom hook for managing content that loads in the background
  Example: 

  const emptyGroupInfo = {
    _id: "",
    name: "",
    .....
  };

  async function fetchGroupInfo() {
    try {
      let result = await api.getGroup({ groupId });
      return data || emptyGroupInfo;
    } catch(err) {
      onFetchError(err);
    }
    return emptyGroupInfo;
  }
  const { isGroupLoading, setIsGroupLoading, groupInfo, setGroupInfo, getGroupInfo } =
    useLoadMonitor({
      variableName:"isGroupLoading",
      variableSetterName:"setIsGroupLoading",
      initialValue:true,
      loadingFunction:fetchGroupInfo,
      resultVariableName:"groupInfo",
      resultVariableSetterName:"setGroupInfo",
      initialResultValue:emptyGroupInfo,
      functionName:"getGroupInfo",
    });

    // load group on page render
      useEffect(() => {
        getGroupInfo();
      }, []);

    Results in:
    isGroupLoading = boolean switch for whether the content is currently loading
    setIsGroupLoading = setter 

    groupInfo = object that starts with empty values and finishes with the group info
    setGroupInfo = setter

    getGroupInfo = function to load groupInfo, which will be loaded with the result of fetchGroupInfo 
*/
import { useState, useRef, useCallback, useEffect } from "react";

export function useLoadMonitor({
  variableName,
  variableSetterName,
  initialValue,
  loadingFunction,
  resultVariableName,
  resultVariableSetterName,
  initialResultValue,
  functionName,
}) {
  const [loadingValue, setLoadingValue] = useState(initialValue);
  const [resultValue, setResultValue] = useState(initialResultValue);
  const loadingFunctionRef = useRef(loadingFunction);

  // in case the function changes somehow, otherwise this will keep using the original function, which means this component doesnt keep rendering infinitely
  useEffect(() => {
    loadingFunctionRef.current = loadingFunction;
  }, [loadingFunction]);

  const loadData = useCallback(async function (...args) {
    try {
      setLoadingValue(true);
      const returnValue = await loadingFunctionRef.current(...args);
      setResultValue(returnValue);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingValue(false);
    }
  }, []);

  const returnValues = {};
  returnValues[variableName] = loadingValue;
  returnValues[variableSetterName] = setLoadingValue;
  returnValues[resultVariableName] = resultValue;
  returnValues[resultVariableSetterName] = setResultValue;
  returnValues[functionName] = loadData;

  return returnValues;
}
